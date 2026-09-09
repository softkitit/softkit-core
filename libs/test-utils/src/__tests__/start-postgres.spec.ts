import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { startPostgres } from '../lib/containers/postgres/start-postgres';

jest.mock('@testcontainers/postgresql', () => ({
  PostgreSqlContainer: jest.fn(),
}));

const PostgreSqlContainerMock = jest.mocked(PostgreSqlContainer);

describe('startPostgres image', () => {
  beforeEach(() => {
    const startedContainer = {
      startedTestContainer: {
        inspectResult: {
          NetworkSettings: {
            Ports: {
              '5432/tcp': [{ HostIp: '0.0.0.0', HostPort: '5432' }],
            },
          },
        },
      },
      getUsername: jest.fn().mockReturnValue('test-user'),
      getPassword: jest.fn().mockReturnValue('secret-test'),
      getDatabase: jest.fn().mockReturnValue('nest'),
    };
    const containerBuilder = {
      withExposedPorts: jest.fn().mockReturnThis(),
      withDatabase: jest.fn().mockReturnThis(),
      withUsername: jest.fn().mockReturnThis(),
      withPassword: jest.fn().mockReturnThis(),
      start: jest.fn().mockResolvedValue(startedContainer),
    };

    PostgreSqlContainerMock.mockImplementation(() => containerBuilder as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses the default Postgres image', async () => {
    await startPostgres({ setupTransactionsManagement: false });

    expect(PostgreSqlContainerMock).toHaveBeenCalledWith(
      'postgres:15.4-alpine',
    );
  });

  it('uses a custom image name and tag', async () => {
    await startPostgres({
      imageName: 'pgvector/pgvector',
      imageTag: 'pg15',
      setupTransactionsManagement: false,
    });

    expect(PostgreSqlContainerMock).toHaveBeenCalledWith(
      'pgvector/pgvector:pg15',
    );
  });
});
