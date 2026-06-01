import { useEffect, useRef, RefObject } from 'react';
import { Keyboard, ScrollView, TextInput } from 'react-native';

/**
 * Quando o teclado abre, faz scroll na ScrollView para garantir que o input
 * focado fique visível acima do teclado.
 *
 * Retorna helpers:
 *  - scrollRef: passar como `ref` do ScrollView
 *  - onScroll: handler para o ScrollView (mantém o offset atual)
 *  - bindFocus(ref): retorna onFocus handler que registra o input focado
 *  - currentScrollY: ref com o offset atual da ScrollView (útil para
 *    cálculos externos, ex.: scroll para erro)
 */
export function useScrollToFocusedInput() {
  const scrollRef = useRef<ScrollView>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const currentScrollY = useRef(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      const input = focusedInputRef.current;
      const scroll = scrollRef.current;
      if (!input || !scroll) return;
      setTimeout(() => {
        try {
          (input as any).measure?.(
            (_x: number, _y: number, _w: number, h: number, _pageX: number, pageY: number) => {
              const keyboardTop = e.endCoordinates.screenY;
              const inputBottom = pageY + h + 24;
              if (inputBottom > keyboardTop) {
                const delta = inputBottom - keyboardTop;
                scroll.scrollTo({
                  y: currentScrollY.current + delta,
                  animated: true,
                });
              }
            },
          );
        } catch {}
      }, 100);
    });
    return () => show.remove();
  }, []);

  const onScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    currentScrollY.current = e.nativeEvent.contentOffset.y;
  };

  const bindFocus = (ref: RefObject<TextInput | null>) => () => {
    focusedInputRef.current = ref.current;
  };

  return { scrollRef, onScroll, bindFocus, currentScrollY };
}
