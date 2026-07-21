using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace api.Tests.Infrastructure;

/// <summary>
/// Boots the real API host against a SQLite in-memory database.
///
/// Two things in Program.cs stop an unconfigured host from starting: it applies
/// migrations on startup, and the Google auth handler rejects empty credentials. Both
/// are satisfied here — the credentials are dummies, since no test performs a real
/// OAuth exchange.
/// </summary>
public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Held open for the factory's lifetime — an in-memory database is discarded
        // when its last connection closes.
        _connection.Open();

        builder.UseEnvironment("Development");
        builder.UseSetting("Auth:AdminEmail", "admin@example.test");
        builder.UseSetting("Auth:Google:ClientId", "test-client-id");
        builder.UseSetting("Auth:Google:ClientSecret", "test-client-secret");

        builder.ConfigureServices(services =>
        {
            var registration = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>)
            );

            if (registration is not null)
            {
                services.Remove(registration);
            }

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection.Dispose();
        }
    }
}
