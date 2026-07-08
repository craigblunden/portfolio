using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("login")]
    [AllowAnonymous]
    public IActionResult Login([FromQuery] string? returnUrl = "/")
    {
        var properties = new AuthenticationProperties { RedirectUri = GetSafeReturnUrl(returnUrl) };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromQuery] string? returnUrl = "/")
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return Redirect(GetSafeReturnUrl(returnUrl));
    }

    [HttpGet("me")]
    [AllowAnonymous]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var isAuthenticated = User.Identity?.IsAuthenticated == true;
        var isAdmin =
            isAuthenticated
            && string.Equals(email, GetAdminEmail(), StringComparison.OrdinalIgnoreCase);

        return Ok(
            new
            {
                isAuthenticated,
                isAdmin,
                email = isAuthenticated ? email : null,
                name = isAuthenticated ? User.Identity?.Name : null,
            }
        );
    }

    private string GetAdminEmail() => _configuration["Auth:AdminEmail"]!;

    private static string GetSafeReturnUrl(string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(returnUrl) || !returnUrl.StartsWith('/'))
        {
            return "/";
        }

        return returnUrl.StartsWith("//", StringComparison.Ordinal) ? "/" : returnUrl;
    }
}
