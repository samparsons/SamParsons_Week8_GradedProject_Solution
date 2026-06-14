import { Button } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';

/**
 * Shared vote buttons component used by QuestionCard, QuestionContent and AnswerList.
 * Handles the auth guard and self-vote guard internally.
 */
const VoteButtons = ({
  voteCount,
  authorId,
  onVote,
  variant = 'outline-secondary',
  upClassName = '',
  downClassName = '',
  countClassName = '',
  upIconClassName = '',
  downIconClassName = '',
  itemType = 'post',
}) => {
  const { userInfo } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;
  const isOwnContent =
    authorId && String(authorId) === String(userInfo?.userId);

  const handleVote = (voteType, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert(`You must be logged in to ${voteType} a ${itemType}.`);
      return;
    }

    if (isOwnContent) {
      alert(`You cannot ${voteType} your own ${itemType}.`);
      return;
    }

    onVote(voteType);
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={(e) => handleVote('upvote', e)}
        className={upClassName}
        disabled={isOwnContent}
        title={isOwnContent ? `You cannot vote on your own ${itemType}` : 'Upvote'}
      >
        <FaArrowUp className={upIconClassName} />
      </Button>
      <span className={countClassName}>{voteCount ?? 0}</span>
      <Button
        variant={variant}
        onClick={(e) => handleVote('downvote', e)}
        className={downClassName}
        disabled={isOwnContent}
        title={isOwnContent ? `You cannot vote on your own ${itemType}` : 'Downvote'}
      >
        <FaArrowDown className={downIconClassName} />
      </Button>
    </>
  );
};

export default VoteButtons;
