'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/inicio')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <header className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-bct2.png"
              alt="Bem Concreto"
              width={180}
              height={180}
              priority
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">
            O FUTURO DOS INVESTIMENTOS IMOBILIÁRIOS
            <br />
            NA PALMA DA SUA MÃO
          </h1>

          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
            Investimento imobiliário fracionado, líquido e acessível.
            Tecnologia, segurança e transparência em um único ecossistema.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primaryDark transition">
                Começar Agora
              </button>
            </Link>

            <Link href="/login">
              <button className="px-8 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition">
                Fazer Login
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* BENEFÍCIOS */}
      <section className="py-16 px-6 bg-surface">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary">
            Por que escolher o BCT?
          </h2>

          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Um novo padrão de investimento imobiliário, pensado para o investidor moderno.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-text">PIX Instantâneo</h3>
              <p className="mt-2 text-muted-foreground">
                Invista em segundos, sem burocracia.
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-text">Segurança Total</h3>
              <p className="mt-2 text-muted-foreground">
                Estrutura auditável e controle transparente.
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-text">Acessível</h3>
              <p className="mt-2 text-muted-foreground">
                Comece com valores baixos e escale quando quiser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary">
            Como Funciona
          </h2>

          <p className="mt-3 text-muted-foreground">
            Três passos simples para investir
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Cadastre-se', desc: 'Crie sua conta em minutos.' },
              { step: 2, title: 'Deposite', desc: 'PIX rápido e seguro.' },
              { step: 3, title: 'Invista', desc: 'Compre BCT e acompanhe.' },
            ].map((item) => (
              <div key={item.step} className="p-8 bg-white rounded-xl shadow-sm border">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {item.step}
                </div>
                <h4 className="mt-4 font-semibold">{item.title}</h4>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 px-6 bg-text text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold">
            Pronto para investir com inteligência?
          </h3>

          <p className="mt-4 text-white/80">
            Faça parte do ecossistema Bem Concreto.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/cadastro">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primaryDark transition">
                Criar Conta Grátis
              </button>
            </Link>

            <Link href="/login">
              <button className="px-6 py-3 border border-white/30 rounded-lg">
                Fazer Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bem Concreto Token
      </footer>
    </div>
  )
}