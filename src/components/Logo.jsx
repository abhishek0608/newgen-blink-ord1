const SITE_LOGO_URL =
  'https://expedite-commerce--xx-ord1.vf.force.com/servlet/servlet.ImageServer?id=015Hp000008X1D3IAK&oid=00D1I000001h13uUAA'

export default function Logo({ height = 26 }) {
  return (
    <img
      src={SITE_LOGO_URL}
      alt="Expedite Commerce"
      style={{
        display: 'block',
        height,
        width: 'auto',
        maxWidth: 160,
        objectFit: 'contain',
      }}
    />
  )
}
