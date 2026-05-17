import { getStatusColor, getStatusBg } from '../../utils/helpers';

export default function StatusBadge({ status, size = 'sm' }) {
  const fontSize = size === 'sm' ? '11px' : '13px';
  const padding = size === 'sm' ? '3px 10px' : '5px 14px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: getStatusBg(status),
        color: getStatusColor(status),
        border: `1px solid ${getStatusColor(status)}30`,
        borderRadius: '999px',
        fontSize,
        fontWeight: 600,
        padding,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: getStatusColor(status),
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
