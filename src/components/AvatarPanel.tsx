import { Avatar } from "primereact/avatar";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import { useUser } from "../context/UserContext";
import { Button } from "primereact/button";
import { useModal } from "./ModalProvider";

export default function AvatarPanel() {
  const { user, logoutUser } = useUser();
  const { openLogin } = useModal();

  const userPanelRef = useRef<OverlayPanel>(null);
  const guestPanelRef = useRef<OverlayPanel>(null);

  return (
    <div>
      {user ? (
        <>
          <Avatar
            image={user.picture}
            size="large"
            shape="circle"
            onClick={(e) => userPanelRef.current?.toggle(e)}
            style={{ cursor: "pointer" }}
          />
          <OverlayPanel ref={userPanelRef}>
            <div className="flex flex-col gap-2 p-2">
              {/* <Button label="Profile" className="p-button-text" icon="pi pi-user" />
              <Button label="Settings" className="p-button-text" icon="pi pi-cog" /> */}
              <Button
                label="Logout"
                className="p-button-text p-button-danger"
                icon="pi pi-sign-out"
                onClick={logoutUser}
              />
            </div>
          </OverlayPanel>
        </>
      ) : (
        <>
          <Button
            className="p-button-rounded p-button-text p-button-plain"
            onClick={(e) => guestPanelRef.current?.toggle(e)}
            icon="pi pi-user"
          />
          <OverlayPanel ref={guestPanelRef}>
            <div className="flex flex-col gap-2 p-2">
              <Button
                label="Sign In"
                icon="pi pi-sign-in"
                className="p-button-text"
                onClick={() => {
                  guestPanelRef.current?.hide(); // close panel
                  openLogin(); // open modal
                }}
              />
              {/* <Button
                label="Register"
                icon="pi pi-user-plus"
                className="p-button-text"
                onClick={() => console.log("Register clicked")}
              /> */}
            </div>
          </OverlayPanel>
        </>
      )}
    </div>
  );
}
