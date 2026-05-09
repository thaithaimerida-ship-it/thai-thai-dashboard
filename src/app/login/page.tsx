import { LockKeyhole } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getErrorMessage(error: string | string[] | undefined): string | null {
  const value = Array.isArray(error) ? error[0] : error;

  if (value === 'invalid') return 'Contraseña incorrecta.';
  if (value === 'config') return 'El acceso al dashboard no está configurado.';

  return null;
}

function getNextPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);
  const nextPath = getNextPath(params?.next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <Card className="w-full max-w-sm border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-900">Acceso Thai Thai</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Ingresa la contraseña para abrir el dashboard.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form action="/api/auth/login" method="post" className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Entrar
            </button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
