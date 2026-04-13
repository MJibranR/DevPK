-- Allow users to delete their own questions
CREATE POLICY "Users can delete their own questions"
ON public.questions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own answers
CREATE POLICY "Users can delete their own answers"
ON public.answers
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own conversations
CREATE POLICY "Users can delete their conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Allow users to delete messages in their conversations
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = messages.conversation_id
  AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
));

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);
