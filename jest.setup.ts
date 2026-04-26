jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockMaterialIcon({ name, ...props }: { name: string }) {
    return React.createElement(Text, props, name);
  };
});
