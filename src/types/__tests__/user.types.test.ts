import { formatStorageUsed, getUserInitials, isAdmin, isActiveUser } from '../../types/user.types';
import type { User } from '../user.types';

describe('user.types helpers', () => {
  it('formats storage sizes', () => {
    expect(formatStorageUsed(0)).toBe('0 Bytes');
    expect(formatStorageUsed(1024)).toContain('KB');
    expect(formatStorageUsed(1024 * 1024)).toContain('MB');
  });

  it('gets initials for single and multi-word names', () => {
    expect(getUserInitials('Cher')).toBe('CH');
    expect(getUserInitials('John Doe')).toBe('JD');
    expect(getUserInitials('  Ana María López  ')).toBe('AL');
  });

  it('detects admin and active users', () => {
    const admin = { role: 'admin', active: true } as User;
    const user = { role: 'user', active: false } as User;
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(user)).toBe(false);
    expect(isActiveUser(admin)).toBe(true);
    expect(isActiveUser(user)).toBe(false);
  });
});
