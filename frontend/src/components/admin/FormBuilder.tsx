import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GripVertical,
  Plus,
  Trash2,
  Type,
  Mail,
  Phone,
  FileText,
  CheckSquare,
  Circle,
  List,
  Hash,
  Calendar,
  Upload,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { FormField, FormFieldType, FormFieldOption } from '@/types/form';

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

interface FieldTypeButton {
  type: FormFieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const fieldTypes: FieldTypeButton[] = [
  { type: 'text', label: 'Текст', icon: <Type className="w-4 h-4" />, description: 'Однострочное текстовое поле' },
  { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, description: 'Поле для email адреса' },
  { type: 'tel', label: 'Телефон', icon: <Phone className="w-4 h-4" />, description: 'Поле для номера телефона' },
  { type: 'textarea', label: 'Многострочный текст', icon: <FileText className="w-4 h-4" />, description: 'Текстовое поле с несколькими строками' },
  { type: 'checkbox', label: 'Чекбокс', icon: <CheckSquare className="w-4 h-4" />, description: 'Флажок для выбора' },
  { type: 'radio', label: 'Радио кнопки', icon: <Circle className="w-4 h-4" />, description: 'Выбор одного варианта' },
  { type: 'select', label: 'Выпадающий список', icon: <List className="w-4 h-4" />, description: 'Список вариантов' },
  { type: 'number', label: 'Число', icon: <Hash className="w-4 h-4" />, description: 'Поле для числового значения' },
  { type: 'date', label: 'Дата', icon: <Calendar className="w-4 h-4" />, description: 'Поле для выбора даты' },
  { type: 'file', label: 'Файл', icon: <Upload className="w-4 h-4" />, description: 'Загрузка файла' },
  { type: 'captcha', label: 'Капча', icon: <ShieldCheck className="w-4 h-4" />, description: 'Ваш компонент защиты от ботов' },
];

// Компонент для draggable кнопки типа поля
function DraggableFieldType({ fieldType, onClick }: { fieldType: FieldTypeButton; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-type-${fieldType.type}`,
    data: { type: 'field-type', fieldType: fieldType.type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Button
        variant="outline"
        className="flex flex-col items-center gap-2 h-auto py-3 w-full cursor-grab active:cursor-grabbing"
        onClick={onClick}
      >
        {fieldType.icon}
        <span className="text-xs">{fieldType.label}</span>
      </Button>
    </div>
  );
}

// Компонент для droppable области формы
function DroppableFormArea({ children, isEmpty }: { children: React.ReactNode; isEmpty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-fields-area',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg' : ''
      }`}
    >
      {isEmpty && (
        <div className="text-center py-8 text-gray-500">
          <p>Поля не добавлены</p>
          <p className="text-sm mt-1">Перетащите поля из списка выше или нажмите на кнопки</p>
        </div>
      )}
      {children}
    </div>
  );
}

interface SortableFieldItemProps {
  field: FormField;
  onEdit: (field: FormField) => void;
  onDelete: (id: string) => void;
}

function SortableFieldItem({ field, onEdit, onDelete }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getFieldIcon = (type: FormFieldType) => {
    const fieldType = fieldTypes.find(ft => ft.type === type);
    return fieldType?.icon || <Type className="w-4 h-4" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 mb-3 shadow-sm ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getFieldIcon(field.type)}
            <span className="font-medium text-sm">{field.label || 'Без названия'}</span>
            {field.required && (
              <span className="text-xs text-red-500">*</span>
            )}
            <span className="text-xs text-gray-500">({field.type})</span>
          </div>
          {field.placeholder && (
            <p className="text-xs text-gray-500 mb-1">Placeholder: {field.placeholder}</p>
          )}
          {field.helpText && (
            <p className="text-xs text-gray-400 mb-1">{field.helpText}</p>
          )}
          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && field.options && (
            <p className="text-xs text-gray-500">
              Варианты: {field.options.length}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(field)}
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(field.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FieldEditorProps {
  field: FormField | null;
  onSave: (field: FormField) => void;
  onCancel: () => void;
}

function FieldEditor({ field, onSave, onCancel }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<FormField>(
    field || {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
    }
  );

  const [newOption, setNewOption] = useState({ label: '', value: '' });

  const handleAddOption = () => {
    if (editedField.type === 'radio' || editedField.type === 'checkbox' || editedField.type === 'select') {
      if (!newOption.label) {
        toast.error('Заполните название варианта');
        return;
      }
    } else {
      if (!newOption.label || !newOption.value) {
        toast.error('Заполните название и значение варианта');
        return;
      }
    }
    const option: FormFieldOption = {
      id: Date.now().toString(),
      label: newOption.label,
      value:
        editedField.type === 'radio' ||
        editedField.type === 'checkbox' ||
        editedField.type === 'select'
          ? newOption.label
          : newOption.value,
    };
    setEditedField({
      ...editedField,
      options: [...(editedField.options || []), option],
    });
    setNewOption({ label: '', value: '' });
  };

  const handleRemoveOption = (optionId: string) => {
    setEditedField({
      ...editedField,
      options: editedField.options?.filter(opt => opt.id !== optionId) || [],
    });
  };

  const handleSave = () => {
    // Для капчи название не требуется, так как компонент сам отображает заголовок
    if (editedField.type !== 'captcha' && !editedField.label.trim()) {
      toast.error('Введите название поля');
      return;
    }
    if ((editedField.type === 'select' || editedField.type === 'radio' || editedField.type === 'checkbox') && 
        (!editedField.options || editedField.options.length === 0)) {
      toast.error('Добавьте хотя бы один вариант');
      return;
    }
    onSave(editedField);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Редактирование поля</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Тип поля</Label>
          <Select
            value={editedField.type}
            onValueChange={(value: FormFieldType) => {
              setEditedField({
                ...editedField,
                type: value,
                options: (value === 'select' || value === 'radio' || value === 'checkbox') 
                  ? (editedField.options || [])
                  : undefined,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map(ft => (
                <SelectItem key={ft.type} value={ft.type}>
                  <div className="flex items-center gap-2">
                    {ft.icon}
                    <span>{ft.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {editedField.type !== 'captcha' && (
          <div className="space-y-2">
            <Label>Название поля *</Label>
            <Input
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              placeholder="Например: Имя, Email, Сообщение"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={editedField.placeholder || ''}
            onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
            placeholder="Подсказка в поле ввода"
          />
        </div>

        <div className="space-y-2">
          <Label>Подсказка (help text)</Label>
          <Textarea
            value={editedField.helpText || ''}
            onChange={(e) => setEditedField({ ...editedField, helpText: e.target.value })}
            placeholder="Дополнительная информация для пользователя"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={editedField.required || false}
            onCheckedChange={(checked) => setEditedField({ ...editedField, required: !!checked })}
          />
          <Label htmlFor="required" className="cursor-pointer">
            Обязательное поле
          </Label>
        </div>

        {(editedField.type === 'select' || editedField.type === 'radio' || editedField.type === 'checkbox') && (
          <div className="space-y-3 border-t pt-4">
            <Label>Варианты выбора</Label>
            {editedField.options?.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setEditedField({
                      ...editedField,
                      options: editedField.options?.map(opt =>
                        opt.id === option.id
                          ? {
                              ...opt,
                              label: newLabel,
                              // для select, radio и checkbox значение всегда равно названию
                              value:
                                editedField.type === 'radio' ||
                                editedField.type === 'checkbox' ||
                                editedField.type === 'select'
                                  ? newLabel
                                  : opt.value,
                            }
                          : opt
                      ),
                    });
                  }}
                  placeholder="Название варианта"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(option.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                placeholder="Название варианта"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="w-4 h-4 mr-1" />
                Добавить
              </Button>
            </div>
          </div>
        )}

        {(editedField.type === 'number' || editedField.type === 'text' || editedField.type === 'textarea') && (
          <div className="space-y-3 border-t pt-4">
            <Label>Валидация</Label>
            <div className="grid grid-cols-2 gap-2">
              {editedField.type === 'number' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Минимум</Label>
                    <Input
                      type="number"
                      value={editedField.validation?.min || ''}
                      onChange={(e) => setEditedField({
                        ...editedField,
                        validation: {
                          ...editedField.validation,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Максимум</Label>
                    <Input
                      type="number"
                      value={editedField.validation?.max || ''}
                      onChange={(e) => setEditedField({
                        ...editedField,
                        validation: {
                          ...editedField.validation,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                </>
              )}
              {(editedField.type === 'text' || editedField.type === 'textarea') && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Мин. длина</Label>
                    <Input
                      type="number"
                      value={editedField.validation?.minLength || ''}
                      onChange={(e) => setEditedField({
                        ...editedField,
                        validation: {
                          ...editedField.validation,
                          minLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Макс. длина</Label>
                    <Input
                      type="number"
                      value={editedField.validation?.maxLength || ''}
                      onChange={(e) => setEditedField({
                        ...editedField,
                        validation: {
                          ...editedField.validation,
                          maxLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1">
            Сохранить
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Если перетаскивается тип поля из списка доступных в область формы
    if (active.id.toString().startsWith('field-type-') && over.id === 'form-fields-area') {
      const fieldType = active.data.current?.fieldType as FormFieldType;
      if (fieldType) {
        const newField: FormField = {
          id: Date.now().toString(),
          type: fieldType,
          label: '',
          placeholder: '',
          required: false,
          ...(fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' ? { options: [] } : {}),
        };
        setEditingField(newField);
      }
      return;
    }

    // Если перетаскивается уже добавленное поле для изменения порядка
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newFields = arrayMove(fields, oldIndex, newIndex);
      onChange(newFields);
    }
  };

  const handleAddField = (type: FormFieldType) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: '',
      placeholder: '',
      required: false,
      ...(type === 'select' || type === 'radio' || type === 'checkbox' ? { options: [] } : {}),
    };
    setEditingField(newField);
  };

  const handleSaveField = (field: FormField) => {
    const existingIndex = fields.findIndex(f => f.id === field.id);
    let newFields: FormField[];
    
    if (existingIndex >= 0) {
      newFields = fields.map((f, idx) => (idx === existingIndex ? field : f));
    } else {
      newFields = [...fields, field];
    }
    
    onChange(newFields);
    setEditingField(null);
    toast.success('Поле сохранено');
  };

  const handleDeleteField = (id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    onChange(newFields);
    toast.success('Поле удалено');
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
  };

  return (
    <div className="space-y-4">
      {editingField && (
        <FieldEditor
          field={editingField}
          onSave={handleSaveField}
          onCancel={() => setEditingField(null)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Card>
          <CardHeader>
            <CardTitle>Доступные поля</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {fieldTypes.map((fieldType) => (
                <DraggableFieldType
                  key={fieldType.type}
                  fieldType={fieldType}
                  onClick={() => handleAddField(fieldType.type)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поля формы ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DroppableFormArea isEmpty={fields.length === 0}>
              {fields.length > 0 && (
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                    />
                  ))}
                </SortableContext>
              )}
            </DroppableFormArea>
          </CardContent>
        </Card>
      </DndContext>
    </div>
  );
}

