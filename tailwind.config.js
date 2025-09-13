/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Polices personnalisées
      fontFamily: {
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'emotional': ['Raleway', 'system-ui', 'sans-serif'],
      },
      // Couleurs personnalisées de la charte graphique
      colors: {
        'sopk': {
          // Couleurs principales
          'lavande': {
            DEFAULT: '#A78BFA',
            'hover': '#9333EA'
          },
          'bleu-ciel': {
            DEFAULT: '#93C5FD',
            'hover': '#3B82F6'
          },
          // Couleurs d'accent
          'corail': {
            DEFAULT: '#FB7185',
            'hover': '#F43F5E'
          },
          'vert-sauge': {
            DEFAULT: '#6EE7B7',
            'hover': '#10B981'
          },
          // Neutres
          'fond-clair': '#F9FAFB',
          'text-principal': '#1F2937',
          'text-secondaire': '#6B7280',
        }
      },
      // Border radius généreux pour les boutons
      borderRadius: {
        'sopk': '0.75rem',
        'sopk-xl': '1rem',
      },
      // Ombres douces
      boxShadow: {
        'sopk-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sopk': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'sopk-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}