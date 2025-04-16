// https://github.com/delfer/docker-alpine-ftp-server
export interface FTPUser {
  name: string;
  password: string;
  folder?: string;
  uid?: string;
  gid?: string;
}

export interface StartFTPServerOptions {
  users?: FTPUser[];
  bindAddress?: string;
  bindToPort?: number;
  minimumPortForPassiveConnections?: number;
  maximumPortForPassiveConnections?: number;
}

export const DEFAULT_START_FTP_SERVER_OPTIONS: Required<StartFTPServerOptions> =
  {
    bindAddress: 'localhost',
    bindToPort: 21,
    minimumPortForPassiveConnections: 21_011,
    maximumPortForPassiveConnections: 21_020,
    users: [
      {
        name: 'alpineftp',
        password: 'alpineftp',
      },
    ],
  };
