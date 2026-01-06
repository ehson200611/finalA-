"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

/**
 * Безопасный компонент изображения с обработкой ошибок
 */
const SafeImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  fallback = null,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      // Если есть fallback, используем его, иначе показываем placeholder
      if (fallback) {
        setImgSrc(fallback);
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Если src не указан или пустой
  if (!src || src === 'null' || src === 'undefined' || src === '') {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        style={{ width, height, minWidth: width, minHeight: height }}
      >
        <span className="text-gray-400 text-xs">No image</span>
      </div>
    );
  }

  // Если это внешний URL (http/https) или путь к медиа файлам, используем обычный img
  // Это предотвращает попытки Next.js оптимизировать изображения, которые могут вернуть 404
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/media/') || src.includes('127.0.0.1') || src.includes('localhost')) {
    return (
      <div className="relative inline-block" style={{ width, height }}>
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
            <span className="text-gray-400 text-xs">Loading...</span>
          </div>
        )}
        {hasError && !fallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
        {(!hasError || fallback) && (
          <img
            src={hasError && fallback ? fallback : imgSrc}
            alt={alt}
            className={`${className} ${isLoading && !hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onError={handleError}
            onLoad={handleLoad}
            style={{ 
              objectFit: 'cover',
              width: width ? `${width}px` : 'auto',
              height: height ? `${height}px` : 'auto',
              maxWidth: '100%',
              ...props.style
            }}
            {...(props.style ? {} : { width, height })}
          />
        )}
      </div>
    );
  }

  // Для локальных изображений используем Next.js Image с unoptimized для внешних
  return (
    <Image
      src={hasError && fallback ? fallback : imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized={imgSrc.startsWith('http')}
      {...props}
    />
  );
};

export default SafeImage;

