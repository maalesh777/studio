
"use client";

import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Locale } from '@/lib/translations';
import { Cog } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = useSettings();

  return (
    <div className="space-y-12">
      <Card className="shadow-2xl border-ring bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
            <Cog className="w-8 h-8 mr-3 text-primary" />
            <span className="animated-gradient-text">{t('settings')}</span>
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {/* Add a description if needed, e.g., "Customize your app experience." */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t('language')}</h3>
            <div className="space-y-2">
              <Label htmlFor="language-select" className="text-base text-muted-foreground">{t('language')}</Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Locale)}
              >
                <SelectTrigger id="language-select" className="w-full md:w-[280px] bg-input/50 border-input focus:border-primary">
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  <SelectItem value="de">{t('german')}</SelectItem>
                  <SelectItem value="en">{t('english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t('appearance')}</h3>
            <div className="space-y-2">
              <Label htmlFor="theme-select" className="text-base text-muted-foreground">{t('theme')}</Label>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value as 'light' | 'dark')}
              >
                <SelectTrigger id="theme-select" className="w-full md:w-[280px] bg-input/50 border-input focus:border-primary">
                  <SelectValue placeholder={t('theme')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  <SelectItem value="light">{t('light')}</SelectItem>
                  <SelectItem value="dark">{t('dark')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
