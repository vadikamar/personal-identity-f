import {
  Mail,
  Phone,
  Linkedin,
  Github,
  Instagram,
  MessageCircle,
  Music,
  Image as ImageIcon,
  Ghost,
} from "lucide-react";

const map = {
  email: Mail,
  call: Phone,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  whatsapp: MessageCircle,
  spotify: Music,
  music: Music,
  photos: ImageIcon,
  snapchat: Ghost,
} as const;

export function ProfileIcon({ name, className }: { name: keyof typeof map; className?: string }) {
  const Icon = map[name] ?? Mail;
  return <Icon className={className} />;
}
