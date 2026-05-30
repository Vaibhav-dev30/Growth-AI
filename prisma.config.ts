import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  migrations: {
    url: 'file:./dev.db',
  },
});
