export default function Logo({ height = 26 }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 800,
        fontSize: height * 0.7,
        letterSpacing: 1,
      }}
    >
      <svg
        height={height}
        viewBox="0 0 48 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="inf-grad" x1="0" y1="0" x2="48" y2="24">
            <stop offset="0" stopColor="#7dc242" />
            <stop offset="1" stopColor="#3e8e1f" />
          </linearGradient>
        </defs>
        <path
          d="M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8c3.2 0 5.9-2 8.4-4.9l3.2-3.7C26.1 8.4 28.8 6 32 6c3.3 0 6 2.7 6 6s-2.7 6-6 6c-2.4 0-4.5-1.7-6.5-4l-1.9 2.2C26 19 28.7 22 32 22c5.5 0 10-4.5 10-10S37.5 2 32 2c-3.9 0-7 2.5-9.6 5.5l-3.2 3.7C17.1 13.6 14.7 16 12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4c2.4 0 4.5 1.7 6.5 4l1.9-2.2C18 7 15.3 4 12 4z"
          fill="url(#inf-grad)"
        />
      </svg>
      INFINITY
    </span>
  )
}
