import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Profile from '../../pages/Profile';
import { renderWithProviders } from '../renderWithProviders';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn()
}));

vi.mock('../../api/axios', () => ({
  default: apiMock
}));

describe('Reader profile page', () => {
  const initialProfile = {
    id: 3,
    name: 'Nomsa Reader',
    email: 'user@example.com',
    role: 'READER',
    bio: 'A devoted reader who loves reflective African literature.',
    avatarUrl: 'https://placehold.co/200x200/0f172a/f8fafc?text=NR',
    websiteUrl: '',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-12T10:00:00.000Z',
    favorites: [
      {
        id: 1,
        book: {
          id: 1,
          title: 'Worlds Apart',
          shortDescription: 'A layered story of fracture and memory.'
        }
      }
    ],
    followingAuthors: [],
    reviews: [],
    comments: [
      {
        id: 11,
        content: 'The emotional pacing in this novel is beautiful.',
        createdAt: '2026-04-06T10:00:00.000Z',
        book: {
          id: 1,
          title: 'Worlds Apart'
        }
      }
    ],
    books: [],
    _count: {
      authorFollowers: 0
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    apiMock.get.mockResolvedValue({
      data: {
        profile: structuredClone(initialProfile)
      }
    });
    apiMock.patch.mockImplementation(async (_url, body) => ({
      data: {
        profile: {
          ...initialProfile,
          ...body
        }
      }
    }));
  });

  test('reader profile loads favorite books and recent reading activity', async () => {
    renderWithProviders(<Profile />, {
      auth: {
        user: { id: 3, name: 'Nomsa Reader', role: 'READER' },
        isAuthenticated: true,
        isReader: true
      }
    });

    expect(await screen.findByRole('heading', { level: 1, name: /nomsa reader/i })).toBeInTheDocument();
    expect(screen.getByText(/favorite books/i)).toBeInTheDocument();
    expect(screen.getAllByText(/worlds apart/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/your latest reading moments/i)).toBeInTheDocument();
  });

  test('reader can save profile changes from the profile form', async () => {
    const user = userEvent.setup();
    const updateUser = vi.fn();

    renderWithProviders(<Profile />, {
      auth: {
        user: { id: 3, name: 'Nomsa Reader', role: 'READER' },
        isAuthenticated: true,
        isReader: true,
        updateUser
      }
    });

    await screen.findByRole('heading', { name: /shape your literary presence/i });

    const nameInput = screen.getByDisplayValue('Nomsa Reader');
    const bioInput = screen.getByDisplayValue('A devoted reader who loves reflective African literature.');

    await user.clear(nameInput);
    await user.type(nameInput, 'Nomsa Reader Updated');
    await user.clear(bioInput);
    await user.type(bioInput, 'An updated bio that confirms the reader profile save flow works.');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(apiMock.patch).toHaveBeenCalledWith('/users/me/profile', {
        name: 'Nomsa Reader Updated',
        bio: 'An updated bio that confirms the reader profile save flow works.',
        avatarUrl: 'https://placehold.co/200x200/0f172a/f8fafc?text=NR',
        websiteUrl: ''
      });
    });

    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nomsa Reader Updated' }));
  });
});
