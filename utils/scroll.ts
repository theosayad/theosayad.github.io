export const scrollToIdWithOffset = (targetId: string, headerOffset = 80) => {
  const element = document.getElementById(targetId);
  if (!element) return false;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });

  return true;
};

