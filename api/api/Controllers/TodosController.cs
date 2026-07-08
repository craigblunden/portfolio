// Controllers/TodosController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")] // resolves to /api/Todos
public class TodosController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodosController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int offset = 0, int limit = 5)
    {
        Console.WriteLine($"GetAll called with offset={offset} and limit={limit}");
        return Ok(await _todoService.GetAllAsync(offset, limit));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var todo = await _todoService.GetByIdAsync(id);
        return todo is null ? NotFound() : Ok(todo);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _todoService.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create(TodoRequestCreateDto todo)
    {
        var createdTodo = await _todoService.CreateAsync(todo);
        return CreatedAtAction(nameof(GetById), new { id = createdTodo.Id }, createdTodo);
    }
}
