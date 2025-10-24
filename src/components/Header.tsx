interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <h1 style={{ color: '#0078ff', fontFamily: 'Arial', marginBottom: '10px' }}>
      {title}
    </h1>
  );
}