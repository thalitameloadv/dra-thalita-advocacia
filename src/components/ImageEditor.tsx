import { useState, useCallback, useRef } from 'react';
import { Image as ImageIcon, Link2, AlignLeft, AlignCenter, AlignRight, Size, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ImageUpload, UploadedImage } from './ImageUpload';
import { toast } from 'sonner';

export interface ImageSettings {
  src: string;
  alt: string;
  title?: string;
  width?: string;
  height?: string;
  align: 'left' | 'center' | 'right' | 'none';
  size: 'small' | 'medium' | 'large' | 'original';
  caption?: string;
  link?: string;
  openInNewTab?: boolean;
}

interface ImageEditorProps {
  onInsert: (imageMarkdown: string) => void;
  onClose: () => void;
  initialImage?: Partial<ImageSettings>;
}

const sizePresets = {
  small: { width: '300px', height: 'auto' },
  medium: { width: '600px', height: 'auto' },
  large: { width: '800px', height: 'auto' },
  original: { width: 'auto', height: 'auto' }
};

const ImageEditor: React.FC<ImageEditorProps> = ({
  onInsert,
  onClose,
  initialImage = {}
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    src: initialImage.src || '',
    alt: initialImage.alt || '',
    title: initialImage.title || '',
    width: initialImage.width || '',
    height: initialImage.height || '',
    align: initialImage.align || 'none',
    size: initialImage.size || 'medium',
    caption: initialImage.caption || '',
    link: initialImage.link || '',
    openInNewTab: initialImage.openInNewTab || false
  });

  const handleImageSelect = useCallback((image: UploadedImage) => {
    setImageSettings(prev => ({
      ...prev,
      src: image.url,
      alt: prev.alt || image.name,
      title: prev.title || image.name
    }));
  }, []);

  const generateMarkdown = useCallback((): string => {
    const { src, alt, title, width, height, align, size, caption, link, openInNewTab } = imageSettings;
    
    if (!src) {
      toast.error('Selecione uma imagem primeiro');
      return '';
    }

    const sizePreset = sizePresets[size];
    const imgWidth = width || sizePreset.width;
    const imgHeight = height || sizePreset.height;

    // Construir atributos da imagem
    let imgMarkdown = `![${alt || ''}](${src}`;
    
    if (title) {
      imgMarkdown += ` "${title}"`;
    }
    
    imgMarkdown += ')';

    // Adicionar dimensões se necessário
    if (imgWidth !== 'auto' || imgHeight !== 'auto') {
      imgMarkdown += `{width="${imgWidth}" height="${imgHeight}"}`;
    }

    // Adicionar alinhamento
    if (align !== 'none') {
      imgMarkdown += `.{align-${align}}`;
    }

    // Adicionar legenda
    if (caption) {
      imgMarkdown += `\n\n*${caption}*`;
    }

    // Adicionar link se necessário
    if (link) {
      const linkTarget = openInNewTab ? ' target="_blank"' : '';
      imgMarkdown = `[${imgMarkdown}](${link}${linkTarget})`;
    }

    return imgMarkdown;
  }, [imageSettings]);

  const handleInsert = useCallback(() => {
    const markdown = generateMarkdown();
    if (markdown) {
      onInsert(markdown);
      onClose();
    }
  }, [generateMarkdown, onInsert, onClose]);

  const handleSizeChange = useCallback((size: 'small' | 'medium' | 'large' | 'original') => {
    const preset = sizePresets[size];
    setImageSettings(prev => ({
      ...prev,
      size,
      width: '',
      height: ''
    }));
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Inserir Imagem
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <ImageUpload
              value={imageSettings.src}
              onChange={(url) => setImageSettings(prev => ({ ...prev, src: url }))}
              onImageSelect={handleImageSelect}
              bucket="blog-images"
              aspectRatio="wide"
              placeholder="Faça upload da imagem para o artigo"
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageSettings.src}
                onChange={(e) => setImageSettings(prev => ({ ...prev, src: e.target.value }))}
              />
            </div>
          </TabsContent>
        </Tabs>

        {imageSettings.src && (
          <>
            <Separator />
            
            <div className="space-y-4">
              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img 
                    src={imageSettings.src} 
                    alt={imageSettings.alt || 'Preview'}
                    className="max-w-full h-auto mx-auto"
                    style={{
                      maxWidth: imageSettings.width || '600px',
                      height: imageSettings.height || 'auto'
                    }}
                  />
                  {imageSettings.caption && (
                    <p className="text-center text-sm text-gray-600 mt-2 italic">
                      {imageSettings.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="altText">Texto Alternativo (Alt)</Label>
                  <Input
                    id="altText"
                    placeholder="Descrição da imagem para acessibilidade"
                    value={imageSettings.alt}
                    onChange={(e) => setImageSettings(prev => ({ ...prev, alt: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleText">Título (Title)</Label>
                  <Input
                    id="titleText"
                    placeholder="Título da imagem (tooltip)"
                    value={imageSettings.title}
                    onChange={(e) => setImageSettings(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              {/* Size and Alignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamanho</Label>
                  <Select
                    value={imageSettings.size}
                    onValueChange={(value: any) => handleSizeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno (300px)</SelectItem>
                      <SelectItem value="medium">Médio (600px)</SelectItem>
                      <SelectItem value="large">Grande (800px)</SelectItem>
                      <SelectItem value="original">Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alinhamento</Label>
                  <Select
                    value={imageSettings.align}
                    onValueChange={(value: any) => setImageSettings(prev => ({ ...prev, align: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o alinhamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centralizado</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Dimensions */}
              {(imageSettings.size === 'original') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customWidth">Largura (px)</Label>
                    <Input
                      id="customWidth"
                      placeholder="auto"
                      value={imageSettings.width}
                      onChange={(e) => setImageSettings(prev => ({ ...prev, width: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customHeight">Altura (px)</Label>
                    <Input
                      id="customHeight"
                      placeholder="auto"
                      value={imageSettings.height}
                      onChange={(e) => setImageSettings(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Legenda</Label>
                <Input
                  id="caption"
                  placeholder="Legenda da imagem (opcional)"
                  value={imageSettings.caption}
                  onChange={(e) => setImageSettings(prev => ({ ...prev, caption: e.target.value }))}
                />
              </div>

              {/* Link Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageLink">Link da Imagem</Label>
                  <Input
                    id="imageLink"
                    placeholder="https://exemplo.com (opcional)"
                    value={imageSettings.link}
                    onChange={(e) => setImageSettings(prev => ({ ...prev, link: e.target.value }))}
                  />
                </div>

                {imageSettings.link && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="openInNewTab"
                      checked={imageSettings.openInNewTab}
                      onCheckedChange={(checked) => setImageSettings(prev => ({ ...prev, openInNewTab: checked }))}
                    />
                    <Label htmlFor="openInNewTab">Abrir em nova aba</Label>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleInsert} disabled={!imageSettings.src}>
            Inserir Imagem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageEditor;
