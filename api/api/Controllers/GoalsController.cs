using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")] // resolves to /api/Todos
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goalService;

    public GoalsController(IGoalService goalService)
    {
        _goalService = goalService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int offset = 0, int limit = 5)
    {
        Console.WriteLine($"GetAll called with offset={offset} and limit={limit}");
        return Ok(await _goalService.GetAllAsync(offset, limit));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create(GoalRequestCreateDto dto)
    {
        var created = await _goalService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { }, created);
    }
}
