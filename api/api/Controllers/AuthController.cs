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

    /// <summary>
    /// Reduces a caller-supplied return URL to a path on this site, or "/".
    ///
    /// "starts with a slash" is not sufficient on its own. Three different inputs
    /// all reach another origin while passing that test:
    ///
    ///   //evil.com        protocol-relative — inherits the current scheme
    ///   /\evil.com        a backslash in the authority position reads as a slash
    ///   /&lt;TAB&gt;/evil.com  tab, newline and CR are stripped when the URL is
    ///                     parsed, re-forming "//evil.com" after the check ran
    ///
    /// All three are neutralised before the leading-slash test rather than after,
    /// otherwise this endpoint becomes an open redirect — a link that reads as
    /// this domain but lands the visitor somewhere else.
    ///
    /// The mirror of this logic is safeReturnPath in todo/src/lib/safe-redirect.ts.
    /// Keep the two in step; they previously drifted, and only this copy was safe.
    /// </summary>
    private static string GetSafeReturnUrl(string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(returnUrl))
        {
            return "/";
        }

        var trimmed = returnUrl.Trim();

        // Mirror what a URL parser does to the string before judging it: drop the
        // characters it ignores, and treat "\" as the "/" it will be read as.
        var normalised = trimmed
            .Replace("\t", string.Empty)
            .Replace("\n", string.Empty)
            .Replace("\r", string.Empty)
            .Replace('\\', '/');

        if (!normalised.StartsWith('/') || normalised.StartsWith("//", StringComparison.Ordinal))
        {
            return "/";
        }

        return trimmed;
    }
}
