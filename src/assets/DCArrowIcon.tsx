import { addIcon } from '@iconify/react';

export function registerDCIcon() {
  addIcon('dc:arrow-icon', {
    body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <g transform="translate(2 1) scale(0.5)"> <path fill="#00BCBC" d="M0 17.763v-5.042h18.105V0L36.21 17.763H0Zm0 5.043 18.105 17.763v-12.72H36.21v-5.043H0Z"/> </g> </svg>`,
    width: 24,
    height: 24,
  });
}
