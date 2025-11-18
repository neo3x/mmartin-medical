import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Pill,
  Activity,
  Shield,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">MARTIN</h1>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
            Tu Asistente Médico{' '}
            <span className="text-primary">Inteligente</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            MARTIN te ayuda a entender tu salud con IA multimodal. Chat de voz,
            interpretación de exámenes, vademecum inteligente y más.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="#features"
              className="rounded-lg border border-border px-8 py-3 text-lg font-medium transition-colors hover:bg-muted"
            >
              Conocer Más
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Características Principales
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10" />}
              title="Chat Inteligente"
              description="Conversa con MARTIN usando texto o voz. Obtén respuestas personalizadas según tu nivel técnico."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10" />}
              title="Interpretación de Exámenes"
              description="Sube tus resultados médicos en PDF y recibe una interpretación clara y personalizada."
            />
            <FeatureCard
              icon={<Pill className="h-10 w-10" />}
              title="Vademecum Inteligente"
              description="Busca medicamentos por foto, texto o voz. Información completa de principios activos y contraindicaciones."
            />
            <FeatureCard
              icon={<Activity className="h-10 w-10" />}
              title="Seguimiento de Salud"
              description="Dashboard personalizado con tu historial clínico, métricas y tendencias de salud."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Privacidad Total"
              description="Tus datos médicos están encriptados y protegidos. Compatible con HIPAA y GDPR."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="IA Multimodal"
              description="Potenciado por los mejores modelos de IA. Soporte para OpenAI, Claude y modelos locales."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Cómo Funciona
          </h2>
          <div className="mx-auto max-w-3xl space-y-8">
            <Step
              number={1}
              title="Regístrate y Crea tu Perfil"
              description="Completa tu información médica básica de forma segura y privada."
            />
            <Step
              number={2}
              title="Interactúa con MARTIN"
              description="Haz preguntas, sube exámenes, busca medicamentos - todo con voz o texto."
            />
            <Step
              number={3}
              title="Recibe Información Personalizada"
              description="Obtén respuestas adaptadas a tu nivel técnico y contexto médico."
            />
            <Step
              number={4}
              title="Construye tu Historial"
              description="MARTIN recuerda tu historial clínico para respuestas cada vez más precisas."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold">
            Comienza a Cuidar tu Salud Hoy
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Únete a miles de personas que ya usan MARTIN para entender mejor su
            salud.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-background px-8 py-3 text-lg font-medium text-foreground transition-colors hover:bg-background/90"
          >
            Registrarse Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <span className="font-bold">MARTIN</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu asistente médico inteligente
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Producto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} MARTIN Medical Assistant. Todos los
              derechos reservados.
            </p>
            <p className="mt-2">
              <strong>Importante:</strong> MARTIN proporciona información
              general y no reemplaza la consulta médica profesional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
