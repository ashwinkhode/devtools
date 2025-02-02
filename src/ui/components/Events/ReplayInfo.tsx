import React, { ReactNode } from "react";
import hooks from "ui/hooks";
import { OperationsData } from "ui/types";
import { formatRelativeTime } from "ui/utils/comments";
import { getDisplayedUrl } from "ui/utils/environment";
import { AvatarImage } from "../Avatar";
import MaterialIcon from "../shared/MaterialIcon";
import Icon from "../shared/Icon";
import { getPrivacySummaryAndIcon } from "../shared/SharingModal/PrivacyDropdown";
import { getUniqueDomains } from "../UploadScreen/Privacy";
import { connect, ConnectedProps, useSelector } from "react-redux";
import * as actions from "ui/actions/app";
import { showDurationWarning, getRecordingId } from "ui/utils/recording";
import { getRecordingTarget } from "ui/reducers/app";
import PrivacyDropdown from "../shared/SharingModal/PrivacyDropdown";
import StatusDropdown from "../shared/StatusDropdown";
import useAuth0 from "ui/utils/useAuth0";

const Row = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => {
  const classes = "flex flex-row space-x-2 p-1.5 px-3 items-center text-left overflow-hidden";

  if (onClick) {
    return (
      <button className={classes} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
};

function ReplayInfo({ setModal }: PropsFromRedux) {
  const { recording } = hooks.useGetRecording(getRecordingId()!);
  const { isAuthenticated } = useAuth0();
  const recordingTarget = useSelector(getRecordingTarget);
  const showEnvironmentVariables = recordingTarget == "node";

  if (!recording) {
    return null;
  }

  const time = formatRelativeTime(new Date(recording.date));
  const { summary, icon } = getPrivacySummaryAndIcon(recording);

  const showOperations = () => {
    setModal("privacy");
  };

  return (
    <div className="flex-column flex flex items-center overflow-hidden border-splitter bg-bodyBgcolor">
      <div className="my-1.5 flex w-full cursor-default flex-col self-stretch overflow-hidden px-1.5 pb-0 text-xs">
        {recording.user ? (
          <Row>
            <AvatarImage className="avatar h-5 w-5 rounded-full" src={recording.user.picture} />
            <div>{recording.user.name}</div>
            <div className="opacity-50">{time}</div>
          </Row>
        ) : null}
        <div className="group">
          {isAuthenticated ? (
            <Row>
              <Icon
                filename={icon}
                className="cursor-pointer bg-iconColor group-hover:bg-primaryAccent"
              />
              <div>
                <PrivacyDropdown {...{ recording }} />
              </div>
            </Row>
          ) : null}
        </div>
        <div className="group">
          {recording.url ? (
            <Row>
              <Icon
                filename="external"
                className="cursor-pointer bg-iconColor group-hover:bg-primaryAccent"
              />
              <div
                className="overflow-hidden overflow-ellipsis whitespace-pre"
                title={recording.url}
              >
                <a href={recording.url} target="_blank" rel="noopener noreferrer">
                  {getDisplayedUrl(recording.url)}
                </a>
              </div>
            </Row>
          ) : null}
        </div>
        {recording.operations ? (
          <OperationsRow operations={recording.operations} onClick={showOperations} />
        ) : null}
        {showEnvironmentVariables ? <EnvironmentVariablesRow /> : null}
        {showDurationWarning(recording) ? <DurationWarningRow /> : null}
      </div>
    </div>
  );
}

function EnvironmentVariablesRow() {
  return (
    <div className="group">
      <Row>
        <Icon filename="warning" className="bg-iconColor" />
        <div>This node recording contains all environment variables</div>
      </Row>
    </div>
  );
}

function DurationWarningRow() {
  return (
    <div className="group">
      <Row>
        <Icon filename="warning" className="bg-iconColor" />
        <div>This replay is over two minutes, which can cause delays</div>
      </Row>
    </div>
  );
}

function OperationsRow({
  operations,
  onClick,
}: {
  operations: OperationsData;
  onClick: () => void;
}) {
  const uniqueDomains = getUniqueDomains(operations);

  if (uniqueDomains.length == 0) {
    return null;
  }

  return (
    <div className="group">
      <Row onClick={onClick}>
        <Icon filename="shield-check" className="bg-iconColor group-hover:bg-primaryAccent" />
        <div>{`Contains potentially sensitive data from ${uniqueDomains.length} domains`}</div>
      </Row>
    </div>
  );
}

const connector = connect(() => ({}), {
  setModal: actions.setModal,
});
type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(ReplayInfo);
