import { useState } from "react";

function useModal(modalNameArr: string[], isVisible: boolean) {
  let stateObj: { [modalName: string]: boolean } = {};
  modalNameArr.map((modal) => (stateObj[modal] = isVisible));
  const [modalVisible, setModalVisible] = useState(stateObj);

  const setModalVisibility = (modalName: string, visible: boolean) => {
    if (!(modalName in modalVisible)) {
      throw new Error("Unknown Modal Name");
    }
    setModalVisible((prevState) => {
      return {
        ...prevState,
        [modalName]: visible,
      };
    });
  };

  return [modalVisible, setModalVisibility] as const;
}

export default useModal;
