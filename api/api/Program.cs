using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var adminEmail = builder.Configuration["Auth:AdminEmail"];

// Fail at startup rather than on the first authenticated request, where a blank
// value surfaces as an opaque ArgumentException from inside OAuthOptions.Validate.
var requiredAuthKeys = new[]
{
    "Auth:AdminEmail",
    "Auth:Google:ClientId",
    "Auth:Google:ClientSecret",
};

var missingAuthKeys = requiredAuthKeys
    .Where(key => string.IsNullOrWhiteSpace(builder.Configuration[key]))
    .ToList();

if (missingAuthKeys.Count > 0)
{
    throw new InvalidOperationException(
        $"Missing required configuration: {string.Join(", ", missingAuthKeys)}. "
            + $"Environment is '{builder.Environment.EnvironmentName}'; note that user secrets "
            + "are only loaded in Development. Set them with 'dotnet user-secrets set \"<key>\" "
            + "\"<value>\" --project api/api/api.csproj', or as app settings when deployed."
    );
}

// Register EF Core with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

var specificOrigins = "AppOrigins";

// The single list of front ends allowed to reach this API. It feeds both the CORS
// policy and the forwarded-host allow list further down, so the two cannot drift.
var allowedOrigins = new List<string>
{
    "https://craigportfolioui-edfzftfbf9gkfcc0.australiaeast-01.azurewebsites.net",
    "https://craigblunden.dev",
};

if (builder.Environment.IsDevelopment())
{
    allowedOrigins.Add("http://localhost:3000");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: specificOrigins,
        policy =>
            policy
                .WithOrigins([.. allowedOrigins])
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
    );
});

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddCookie(options =>
    {
        options.Cookie.Name = "portfolio_admin";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.SlidingExpiration = true;
        options.ExpireTimeSpan = TimeSpan.FromDays(14);
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
        options.Events.OnValidatePrincipal = async context =>
        {
            var email = context.Principal?.FindFirstValue(ClaimTypes.Email);

            if (!string.Equals(email, adminEmail, StringComparison.OrdinalIgnoreCase))
            {
                context.RejectPrincipal();
                await context.HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme
                );
            }
        };
    })
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Auth:Google:ClientId"] ?? string.Empty;
        options.ClientSecret = builder.Configuration["Auth:Google:ClientSecret"] ?? string.Empty;
        options.CallbackPath = "/api/auth/callback";
        options.SaveTokens = false;
        options.Events.OnTicketReceived = async context =>
        {
            var email = context.Principal?.FindFirstValue(ClaimTypes.Email);

            if (!string.Equals(email, adminEmail, StringComparison.OrdinalIgnoreCase))
            {
                await context.HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme
                );
                context.HandleResponse();
                context.Response.Redirect("/?auth=denied");
            }
        };
        options.Events.OnRemoteFailure = async context =>
        {
            await context.HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme
            );
            context.HandleResponse();
            context.Response.Redirect("/?auth=denied");
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        "AdminOnly",
        policy =>
            policy
                .RequireAuthenticatedUser()
                .RequireAssertion(context =>
                    string.Equals(
                        context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
                        adminEmail,
                        StringComparison.OrdinalIgnoreCase
                    )
                )
    );
});

// Register your services for DI — this is like a manual IoC container
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();
builder.Services.AddScoped<IGoalService, GoalService>();

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        )
    );
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedHost | ForwardedHeaders.XForwardedProto;

    // App Service fronts this app from an address range that is not stable, so the
    // usual "trust these proxy IPs" check cannot be used and the lists are cleared.
    // That alone would mean trusting X-Forwarded-Host from any caller, which lets a
    // request rewrite the host the app believes it is serving. Pinning the accepted
    // hosts restores the bound the IP check would otherwise have given us: a spoofed
    // header is dropped instead of honoured.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
    options.AllowedHosts =
    [
        .. allowedOrigins
            .Select(origin => new Uri(origin).Host)
            .Distinct(StringComparer.OrdinalIgnoreCase),
    ];
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    app.Logger.LogInformation("Database migrations applied successfully.");
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Failed to apply database migrations during startup.");
    throw;
}

app.UseForwardedHeaders();
app.UseCors(specificOrigins);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();

/// <summary>
/// Top-level statements generate an internal Program class, which
/// WebApplicationFactory cannot reach. Exposing it publicly is the documented way to
/// make the host testable.
/// </summary>
public partial class Program { }
