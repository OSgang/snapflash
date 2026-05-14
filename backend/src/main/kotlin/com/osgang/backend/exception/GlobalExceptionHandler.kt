package com.osgang.backend.exception;
//snapflash\backend\src\main\kotlin\com\osgang\backend\exception\GlobalExceptionHandler.kt
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


class AppException(
    val errorCode: ErrorCode
) : RuntimeException(errorCode.message)


@ControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(AppException::class)
    fun handleAppException(exception: AppException): ResponseEntity<String> {
        return ResponseEntity
            .badRequest()
            .body(
                exception.message
            )
    }
    // ResponseEntity<String> handlingRuntimeException(AppException exception){
    //     return ResponseEntity.badRequest().body(exception.message);
    // }
    
}
