import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__)))

# INQDO TOOLS
from inqdo_tools import Invoker, Response


def _handle_internal(event, body, context, logger):
    logger.info("Handler!")

    return Response(body={"success": 200}).ok()


def handler(
    event,
    context,
):
    return Invoker(
        file=__file__,
        event=event,
        context=context,
        delegate=_handle_internal,
    ).lambda_handler()
