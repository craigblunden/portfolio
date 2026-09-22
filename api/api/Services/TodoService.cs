public class TodoService : ITodoService
{
    private readonly ITodoRepository _todoRepository;

    public TodoService(ITodoRepository todoRepository)
    {
        _todoRepository = todoRepository;
    }

    async Task ITodoService.DeleteAsync(int id)
    {
        await _todoRepository.RemoveAsync(id);
    }

    async Task<TodoResponseDto> ITodoService.CreateAsync(TodoRequestCreateDto dto)
    {
        var todo = new Todo { Title = dto.Title, GoalId = dto.GoalId };
        await _todoRepository.AddAsync(todo);
        return ToResponse(todo);
    }

    async Task<PagedResponseDto<TodoResponseDto>> ITodoService.GetAllAsync(int offset, int limit)
    {
        var (safeOffset, safeLimit) = PageBounds.Clamp(offset, limit);

        var todos = await _todoRepository.GetAllAsync(safeOffset, safeLimit);
        var totalCount = await _todoRepository.GetTotalCountAsync();
        var pageNumber = safeOffset / safeLimit + 1;
        var totalPages = (int)Math.Ceiling(totalCount / (double)safeLimit);

        return new PagedResponseDto<TodoResponseDto>(
            todos.Select(ToResponse),
            new PagedResponseMetaDto(totalPages, pageNumber < totalPages, pageNumber > 1)
        );
    }

    async Task<TodoResponseDto?> ITodoService.GetByIdAsync(int id)
    {
        var todo = await _todoRepository.GetByIdAsync(id);
        return todo is null ? null : ToResponse(todo);
    }

    async Task<TodoResponseDto?> ITodoService.UpdateAsync(int id, TodoRequestUpdateDto dto)
    {
        var todo = await _todoRepository.GetByIdAsync(id);
        if (todo is null)
            return null;

        if (dto.Title is not null)
            todo.Title = dto.Title;
        if (dto.Status.HasValue)
            todo.Status = dto.Status.Value;
        if (dto.GoalId.HasValue)
            todo.GoalId = dto.GoalId.Value;

        await _todoRepository.UpdateAsync(todo);
        return ToResponse(todo);
    }

    private static TodoResponseDto ToResponse(Todo todo) =>
        new()
        {
            Id = todo.Id,
            Title = todo.Title,
            Status = todo.Status,
            GoalId = todo.GoalId,
        };
}
