using System.Text.RegularExpressions;

namespace api.Tests.Services;

/// <summary>
/// Goal slugs are referenced from committed markdown files, so they are part of a
/// public contract: they must be stable, URL-safe, and never collide.
/// </summary>
public class SlugGeneratorTests
{
    /// <summary>Mirrors the slug format the frontend enforces on frontmatter.</summary>
    private const string SlugFormat = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

    [Theory]
    [InlineData("Land the next senior engineering role", "land-the-next-senior-engineering-role")]
    [InlineData("Keep a steady reading habit", "keep-a-steady-reading-habit")]
    [InlineData("already-kebab-case", "already-kebab-case")]
    public void Slugify_PlainName_LowercasesAndHyphenates(string name, string expected)
    {
        Assert.Equal(expected, SlugGenerator.Slugify(name));
    }

    [Theory]
    [InlineData("C# & .NET: deep dive!", "c-net-deep-dive")]
    [InlineData("What's next?", "whats-next")]
    public void Slugify_NameWithPunctuation_StripsPunctuation(string name, string expected)
    {
        Assert.Equal(expected, SlugGenerator.Slugify(name));
    }

    [Theory]
    [InlineData("Café résumé", "cafe-resume")]
    [InlineData("naïve piñata", "naive-pinata")]
    public void Slugify_NameWithAccents_FoldsToAscii(string name, string expected)
    {
        Assert.Equal(expected, SlugGenerator.Slugify(name));
    }

    [Theory]
    [InlineData("  leading and trailing  ", "leading-and-trailing")]
    [InlineData("multiple   inner   spaces", "multiple-inner-spaces")]
    [InlineData("already--hyphenated", "already-hyphenated")]
    public void Slugify_IrregularWhitespace_CollapsesToSingleHyphens(string name, string expected)
    {
        Assert.Equal(expected, SlugGenerator.Slugify(name));
    }

    /// <summary>
    /// A goal named only in punctuation or emoji would otherwise slugify to an empty
    /// string, which is not a usable key. Falling back beats throwing here — goal
    /// creation should not fail over an unusual name.
    /// </summary>
    [Theory]
    [InlineData("!!!")]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("🎯")]
    public void Slugify_NameWithNoSluggableCharacters_FallsBackToGoal(string name)
    {
        Assert.Equal("goal", SlugGenerator.Slugify(name));
    }

    [Theory]
    [InlineData("Land the next senior engineering role")]
    [InlineData("C# & .NET: deep dive!")]
    [InlineData("Café résumé")]
    [InlineData("  leading and trailing  ")]
    [InlineData("!!!")]
    [InlineData("🎯")]
    public void Slugify_AnyInput_ProducesSlugMatchingTheContractFormat(string name)
    {
        var slug = SlugGenerator.Slugify(name);

        Assert.Matches(SlugFormat, slug);
    }

    [Fact]
    public async Task EnsureUniqueAsync_SlugIsFree_ReturnsItUnchanged()
    {
        var taken = new HashSet<string>();

        var result = await SlugGenerator.EnsureUniqueAsync(
            "reading-habit",
            slug => Task.FromResult(taken.Contains(slug))
        );

        Assert.Equal("reading-habit", result);
    }

    [Fact]
    public async Task EnsureUniqueAsync_SlugTaken_AppendsSuffixTwo()
    {
        var taken = new HashSet<string> { "reading-habit" };

        var result = await SlugGenerator.EnsureUniqueAsync(
            "reading-habit",
            slug => Task.FromResult(taken.Contains(slug))
        );

        Assert.Equal("reading-habit-2", result);
    }

    [Fact]
    public async Task EnsureUniqueAsync_SlugAndFirstSuffixTaken_AppendsSuffixThree()
    {
        var taken = new HashSet<string> { "reading-habit", "reading-habit-2" };

        var result = await SlugGenerator.EnsureUniqueAsync(
            "reading-habit",
            slug => Task.FromResult(taken.Contains(slug))
        );

        Assert.Equal("reading-habit-3", result);
    }

    [Fact]
    public async Task EnsureUniqueAsync_SuffixedSlug_StillMatchesTheContractFormat()
    {
        var taken = new HashSet<string> { "reading-habit" };

        var result = await SlugGenerator.EnsureUniqueAsync(
            "reading-habit",
            slug => Task.FromResult(taken.Contains(slug))
        );

        Assert.Matches(SlugFormat, result);
    }
}
