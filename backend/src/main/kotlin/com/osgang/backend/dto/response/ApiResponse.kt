

data class ApiResponse<T>(
    val code: ErrorCode,
    val message: String,
    val result: T
)