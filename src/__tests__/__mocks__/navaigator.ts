import * as React from 'react';

// Mock NavAIgator components for Jest tests
const createMockComponent = (name: string) => {
  const MockComponent = React.forwardRef((props: any, _ref: any) => {
    const { children, ...rest } = props;
    return React.createElement(name, { ...rest, 'data-testid': name }, children);
  });
  MockComponent.displayName = name;
  return MockComponent;
};

export const Button = createMockComponent('Button');
export const Badge = createMockComponent('Badge');
export const Table = createMockComponent('Table');
export const Drawer = createMockComponent('Drawer');
export const Dialog = createMockComponent('Dialog');
export const Select = createMockComponent('Select');
export const SelectField = createMockComponent('SelectField');
export const SelectTrigger = createMockComponent('SelectTrigger');
export const SelectContent = createMockComponent('SelectContent');
export const SelectItem = createMockComponent('SelectItem');
export const TextInput = createMockComponent('TextInput');

export const TableHeader = createMockComponent('TableHeader');
export const TableBody = createMockComponent('TableBody');
export const TableFooter = createMockComponent('TableFooter');
export const TableRow = createMockComponent('TableRow');
export const TableHead = createMockComponent('TableHead');
export const TableCell = createMockComponent('TableCell');
export const TableCaption = createMockComponent('TableCaption');

export const DrawerHeader = createMockComponent('DrawerHeader');
export const DrawerBody = createMockComponent('DrawerBody');
export const DrawerFooter = createMockComponent('DrawerFooter');

export const DialogTrigger = createMockComponent('DialogTrigger');
export const DialogClose = createMockComponent('DialogClose');
export const DialogContent = createMockComponent('DialogContent');
export const DialogHeader = createMockComponent('DialogHeader');
export const DialogFooter = createMockComponent('DialogFooter');
export const DialogTitle = createMockComponent('DialogTitle');
export const DialogDescription = createMockComponent('DialogDescription');
export const DialogBody = createMockComponent('DialogBody');
