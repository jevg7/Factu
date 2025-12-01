import { useState } from 'react';
import { Exam, CartItem } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { FileText, Plus } from 'lucide-react';

interface ExamListProps {
  exams: Exam[];
  onAddToCart: (exam: Exam, price: number) => void;
  cart: CartItem[];
}

export function ExamList({ exams, onAddToCart, cart }: ExamListProps) {
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePriceChange = (examId: string, price: number) => {
    setCustomPrices(prev => ({
      ...prev,
      [examId]: price
    }));
  };

  const getPrice = (exam: Exam) => {
    return customPrices[exam.id] ?? exam.basePrice;
  };

  const isInCart = (examId: string) => {
    return cart.some(item => item.exam.id === examId);
  };

  const groupedExams = filteredExams.reduce((acc, exam) => {
    if (!acc[exam.category]) {
      acc[exam.category] = [];
    }
    acc[exam.category].push(exam);
    return acc;
  }, {} as { [category: string]: Exam[] });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Exámenes Médicos
        </CardTitle>
        <Input
          placeholder="Buscar exámenes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedExams).map(([category, categoryExams]) => (
          <div key={category}>
            <Badge variant="outline" className="mb-2">{category}</Badge>
            <div className="space-y-2">
              {categoryExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col gap-2 p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{exam.name}</p>
                      <p className="text-sm text-muted-foreground">{exam.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`price-${exam.id}`} className="text-sm">Precio:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm">$</span>
                        <Input
                          id={`price-${exam.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={getPrice(exam)}
                          onChange={(e) => handlePriceChange(exam.id, parseFloat(e.target.value) || 0)}
                          className="w-20 pl-6"
                        />
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => onAddToCart(exam, getPrice(exam))}
                      disabled={isInCart(exam.id)}
                      className="ml-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {isInCart(exam.id) ? 'Añadido' : 'Añadir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredExams.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron exámenes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}