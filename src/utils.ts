export function capitalize<S extends string>(value: S): Capitalize<S> {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<S>;
}

export function titleize(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\w\S*/g, (word) => capitalize(word));
}

export function getQueryVariable(variableName: string, required = false): string | undefined {
  const query = window.location.search.substring(1);
  const parameters = query.split('&');

  for (let i = 0; i < parameters.length; i++) {
    const pair = parameters[i].split('=');

    if (pair.length === 2 && decodeURIComponent(pair[0]) === variableName) {
      return decodeURIComponent(pair[1]);
    }
  }

  if (required) {
    throw new Error(`Query variable ${variableName} not found!`);
  }

  return undefined;
}

export function imageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width / 2, height: img.height / 2 });
    };
    img.src = dataUrl;
  });
}

export function arrayBufferToDataUrl(buffer: ArrayBuffer, type = 'image/png'): string {
  const blob = new Blob([buffer], { type });

  return URL.createObjectURL(blob);
}
