using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var adminEmail = builder.Configuration["Auth:AdminEmail"];

// Register EF Core with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

var specificOrigins = "AppOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: specificOrigins,
        policy =>
        {
            var origins = new List<string>
            {
                "https://craigportfolioui-edfzftfbf9gkfcc0.australiaeast-01.azurewebsites.net",
            };

            if (builder.Environment.IsDevelopment())
            {
                origins.Add("http://localhost:3000");
            }

            policy.WithOrigins([.. origins]).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
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
                await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
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
                await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                context.HandleResponse();
                context.Response.Redirect("/?auth=denied");
            }
        };
        options.Events.OnRemoteFailure = async context =>
        {
            await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            context.HandleResponse();
            context.Response.Redirect("/?auth=denied");
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        "AdminOnly",
        policy =>
            policy.RequireAuthenticatedUser()
                .RequireAssertion(context =>
                    context.User.Claims.Any(claim =>
                        claim.Type == "email"
                        && string.Equals(claim.Value, adminEmail, StringComparison.OrdinalIgnoreCase)
                    )
                )
    );
});

// Register your services for DI — this is like a manual IoC container
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();
builder.Services.AddScoped<IGoalService, GoalService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedHost | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
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
