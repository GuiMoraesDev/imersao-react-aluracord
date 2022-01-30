import { useRouter } from 'next/router';

import React from 'react';

import { uniqueId } from 'lodash';

import Button from 'components/Button';
import Text from 'components/Text';
import { TextArea } from 'components/TextField';
import Title from 'components/Title';

import { useAuth } from 'context/auth';

import useErrors from 'hooks/useErrors';

import * as Styles from 'styles/pages/chat';

interface IMessageProps {
  id: string;
  from: string;
  text: string;
}

const Chat = () => {
  const { user, clearUser } = useAuth();
  const router = useRouter();

  const [errorsState, errorsDispatch] = useErrors({
    userMessage: {
      message: 'Message is a required field',
    },
  });

  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const [listMessages, setListMessages] = React.useState<IMessageProps[]>([]);

  const generateMessageMetadata = React.useCallback(
    (from: string, message: string): IMessageProps => {
      return {
        id: uniqueId(),
        from,
        text: message,
      };
    },
    []
  );
  const handleLogout = React.useCallback(() => {
    clearUser();

    router.push('/');
  }, [clearUser, router]);
  const handleClearError = React.useCallback(() => {
    errorsDispatch({
      state: 'valid',
      payload: 'userMessage',
    });
  }, [errorsDispatch]);
  const handleSubmit = React.useCallback(() => {
    if (inputRef.current?.value) {
      const message = inputRef.current?.value;

      const messageData = generateMessageMetadata(
        user?.name || 'Not Identified',
        message
      );

      setListMessages((state) => [...state, messageData]);

      inputRef.current.value = '';
    }

    return errorsDispatch({
      state: 'invalid',
      payload: 'userMessage',
    });
  }, [errorsDispatch, generateMessageMetadata, user?.name]);

  return (
    <Styles.Container>
      <Styles.Content>
        <Styles.Header>
          <div>
            <Title as="h1">Chat</Title>
            <Text>Welcome, {user?.name}</Text>
          </div>

          <Button
            as="button"
            label="Logout"
            dimension="md"
            rounded="sm"
            variant="outline"
            onClick={handleLogout}
          />
        </Styles.Header>

        <Styles.ChatWrapper>
          {listMessages.map((message) => (
            <Styles.ChatMessage key={message.id}>
              <header>
                <img src={user?.avatar_url} alt={user?.name} />
                <strong>{message.from}</strong>
              </header>
              <p>{message.text}</p>
            </Styles.ChatMessage>
          ))}
        </Styles.ChatWrapper>

        <Styles.UserInputWrapper>
          <TextArea
            fullWidth
            error={errorsState.userMessage}
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();

                handleSubmit();
              }
            }}
            handleOnChange={handleClearError}
            placeholder="Type our message here..."
            dimension="xs"
            ref={inputRef}
          />
          <Button label="Send" dimension="xl" onClick={handleSubmit} />
        </Styles.UserInputWrapper>
      </Styles.Content>
    </Styles.Container>
  );
};

export default Chat;
