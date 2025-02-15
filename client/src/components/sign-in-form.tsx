import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SONNER_ERROR_STYLE } from '@/constants/sonner'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/axios'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  email: z.string().email('Deve ser um email válido'),
  password: z.string(),
})

export function SignInForm() {
  const { login } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit({ email, password }: z.infer<typeof formSchema>) {
    setIsProcessing(true)

    try {
      const response = await api.post('/sessions', {
        email,
        password,
      })

      login(response.data.access_token)
    } catch (loginErr) {
      setIsProcessing(false)
      let message = 'Erro no login.'

      if (loginErr instanceof AxiosError) {
        const errorMessage = loginErr.status === 400
          ? 'Requisição inválida'
          : loginErr.status === 401
            ? 'Credenciais Inválidas'
            : message

        message = `[${loginErr.status}] ${errorMessage}`
      }

      toast(message, SONNER_ERROR_STYLE)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="usuario@email.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input placeholder="******" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end">
          <Button
            size="lg"
            type="submit"
            variant="success"
            className={cn(['w-full mt-4', isProcessing && 'opacity-60'])}
            disabled={isProcessing}
          >
            {isProcessing
              ? (<Loader2 className="animate-spin" />)
              : 'Entrar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
