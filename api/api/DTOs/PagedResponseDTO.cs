public record PagedResponseMetaDto(
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
);

public record PagedResponseDto<T>(
    IEnumerable<T> Payload,
    PagedResponseMetaDto Meta
);