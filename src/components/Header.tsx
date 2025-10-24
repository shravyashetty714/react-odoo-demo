type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <h1 style={{ color: "#0078ff", fontFamily: "Arial" }}>{title}</h1>
  );
}
