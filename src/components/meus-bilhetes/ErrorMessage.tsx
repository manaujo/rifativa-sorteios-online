
import { Card, CardContent } from "@/components/ui/card";

interface ErrorMessageProps {
  error: Error | null;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) return null;

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600 text-center">
            Erro ao buscar bilhetes. Tente novamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorMessage;
