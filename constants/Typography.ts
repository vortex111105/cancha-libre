import { Colors } from './Colors';

export const Typography = {
  h1: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
    color: Colors.text,
    letterSpacing: -1,
  },
  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  h3: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textMuted,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDim,
  },
  button: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#000',
  }
};
