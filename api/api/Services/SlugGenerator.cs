using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

/// <summary>
/// Derives URL-safe slugs for goals. Slugs are referenced from committed markdown
/// frontmatter, so once assigned they are a public contract — see tasks/spec-blog.md.
/// </summary>
public static partial class SlugGenerator
{
    /// <summary>Used when a name contains nothing sluggable (punctuation or emoji only).</summary>
    private const string Fallback = "goal";

    [GeneratedRegex(@"[^a-z0-9\s-]")]
    private static partial Regex NonSlugCharacters();

    [GeneratedRegex(@"[\s-]+")]
    private static partial Regex SeparatorRuns();

    public static string Slugify(string name)
    {
        // FormD splits accented characters into base + combining mark, so dropping
        // the marks folds "é" to "e" rather than deleting the character entirely.
        var decomposed = name.ToLowerInvariant().Normalize(NormalizationForm.FormD);

        var folded = new string(
            [
                .. decomposed.Where(c =>
                    CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark
                ),
            ]
        );

        var slug = NonSlugCharacters().Replace(folded, string.Empty);
        slug = SeparatorRuns().Replace(slug, "-").Trim('-');

        return slug.Length == 0 ? Fallback : slug;
    }

    /// <summary>
    /// Suffixes the slug until it is free. Never overwrites an existing slug — markdown
    /// files reference these, so silently reassigning one would break a published link.
    /// </summary>
    public static async Task<string> EnsureUniqueAsync(string slug, Func<string, Task<bool>> exists)
    {
        if (!await exists(slug))
        {
            return slug;
        }

        for (var suffix = 2; ; suffix++)
        {
            var candidate = $"{slug}-{suffix}";

            if (!await exists(candidate))
            {
                return candidate;
            }
        }
    }
}
