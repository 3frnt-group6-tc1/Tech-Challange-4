const React = require("react");

const createIconMock = (name) => {
  const IconComponent = (props) => React.createElement(name, props);
  IconComponent.displayName = name;
  return IconComponent;
};

module.exports = {
  Ionicons: createIconMock("Ionicons"),
  MaterialIcons: createIconMock("MaterialIcons"),
  FontAwesome: createIconMock("FontAwesome"),
  Feather: createIconMock("Feather"),
  AntDesign: createIconMock("AntDesign"),
  Entypo: createIconMock("Entypo"),
  EvilIcons: createIconMock("EvilIcons"),
  FontAwesome5: createIconMock("FontAwesome5"),
  Foundation: createIconMock("Foundation"),
  MaterialCommunityIcons: createIconMock("MaterialCommunityIcons"),
  Octicons: createIconMock("Octicons"),
  SimpleLineIcons: createIconMock("SimpleLineIcons"),
  Zocial: createIconMock("Zocial"),
};

