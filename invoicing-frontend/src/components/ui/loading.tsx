
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'md', text = 'Loading...', fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'flex items-center justify-center min-h-screen' 
    : 'flex items-center justify-center min-h-[200px]';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-gray-900 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}
