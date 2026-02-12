import { render, screen, fireEvent } from '@testing-library/react';
import DropZone from '../DropZone';

describe('DropZone interactions and edge cases', () => {
  it('shows drag over text on dragOver and reverts on dragLeave', () => {
    const onFilesSelected = jest.fn();
    render(<DropZone onFilesSelected={onFilesSelected} /> as any);

    const zone = screen.getByRole('button');
    fireEvent.dragOver(zone);
    expect(screen.getByText(/Suelta los archivos aquí/i)).toBeInTheDocument();

    fireEvent.dragLeave(zone);
    expect(screen.getByText(/Arrastra archivos aquí/i)).toBeInTheDocument();
  });

  it('calls onFilesSelected when files are dropped', () => {
    const onFilesSelected = jest.fn();
    render(<DropZone onFilesSelected={onFilesSelected} /> as any);

    const zone = screen.getByRole('button');

    const file = new File(['a'], 'a.txt', { type: 'text/plain' });
    const data = {
      dataTransfer: { files: [file], types: ['Files'] },
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    } as unknown as DragEvent;

    fireEvent.drop(zone, data as any);
    expect(onFilesSelected).toHaveBeenCalled();
  });

  it('click triggers file input when not disabled', () => {
    const onFilesSelected = jest.fn();
    render(<DropZone onFilesSelected={onFilesSelected} /> as any);
    const zone = screen.getByRole('button');
    const input = zone.querySelector('input[type=file]') as HTMLInputElement;
    // spy on click
    const spy = jest.spyOn(input, 'click');
    fireEvent.click(zone);
    expect(spy).toHaveBeenCalled();
  });

  it('keyboard Enter triggers file input click', () => {
    const onFilesSelected = jest.fn();
    render(<DropZone onFilesSelected={onFilesSelected} /> as any);
    const zone = screen.getByRole('button');
    const input = zone.querySelector('input[type=file]') as HTMLInputElement;
    const spy = jest.spyOn(input, 'click');
    fireEvent.keyDown(zone, { key: 'Enter' });
    expect(spy).toHaveBeenCalled();
  });

  it('does not allow interactions when disabled', () => {
    const onFilesSelected = jest.fn();
    render(<DropZone onFilesSelected={onFilesSelected} disabled={true} /> as any);
    const zone = screen.getByRole('button');
    fireEvent.click(zone);
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});
