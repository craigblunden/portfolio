using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

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
                "https://yourfrontend.com",
                "https://www.yourfrontend.com",
            };

            if (builder.Environment.IsDevelopment())
            {
                origins.Add("http://localhost:3000");
            }

            policy.WithOrigins([.. origins]).AllowAnyHeader().AllowAnyMethod();
        }
    );
});

// Register your services for DI — this is like a manual IoC container
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();
builder.Services.AddScoped<IGoalService, GoalService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(specificOrigins);
app.UseHttpsRedirection();
app.MapControllers();

await app.RunAsync();
