using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace api.Tests.Infrastructure;

/// <summary>
/// A real SQLite database held in memory.
///
/// Deliberately not the EF Core InMemory provider: InMemory does not enforce unique
/// indexes, so a duplicate-slug test would pass against it while production throws —
/// the exact bug these tests exist to catch.
///
/// Applies the real migrations rather than EnsureCreated, so a malformed migration
/// fails here before it reaches a real database.
/// </summary>
public sealed class SqliteInMemoryDatabase : IDisposable
{
    private readonly SqliteConnection _connection;

    public SqliteInMemoryDatabase()
    {
        // An in-memory SQLite database lives only as long as its connection, so this
        // one is held open for the lifetime of the fixture.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        using var context = CreateContext();
        context.Database.Migrate();
    }

    /// <summary>
    /// Creates a fresh context over the same database. Tests use separate contexts for
    /// writing and reading so assertions hit the database rather than the change tracker.
    /// </summary>
    public AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);

    public void Dispose() => _connection.Dispose();
}
